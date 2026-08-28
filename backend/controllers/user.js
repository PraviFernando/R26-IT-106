const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const signup = async (req, res, next) => {
  const { username, email, password, role } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Username, email and password are required' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role: role || 'patient', // only allow valid roles via enum
    });

    await newUser.save();

    // Optional: auto-login after signup
    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: pass, ...userWithoutPassword } = newUser._doc;

    res
      .status(201)
      .cookie('access_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({
        message: 'Signup successful',
        token,                          // ← returned for cross-origin Expo Web use
        user: userWithoutPassword,
      });
  } catch (error) {
    next(error);
  }
};

const signin = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password || email === '' || password === '') {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const validUser = await User.findOne({ email });
    if (!validUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const validPassword = await bcrypt.compare(password, validUser.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: validUser._id, role: validUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    validUser.isOnline = true;
    validUser.lastLogin = Date.now();
    validUser.deviceType = req.headers['user-agent'] || 'Unknown';
    await validUser.save();

    const { password: pass, ...rest } = validUser._doc;

    res
      .status(200)
      .cookie('access_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({ ...rest, token });        // ← token also in body for cross-origin clients
  } catch (error) {
    next(error);
  }
};

const signOut = async (req, res, next) => {
  try {
    if (req.user && req.user.id) {
      await User.findByIdAndUpdate(req.user.id, { isOnline: false });
    }
    res
      .clearCookie('access_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      })
      .status(200)
      .json({ message: 'User has been signed out' });
  } catch (error) {
    next(error);
  }
};

const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { fullName, age, email, phoneNumber, district, village, babyDetails, currentWeight, currentLength } = req.body;
    const updateFields = {};
    if (fullName !== undefined) updateFields.fullName = fullName;
    if (age !== undefined) updateFields.age = age;
    if (email !== undefined) updateFields.email = email;
    if (phoneNumber !== undefined) updateFields.phoneNumber = phoneNumber;
    if (district !== undefined) updateFields.district = district;
    if (village !== undefined) updateFields.village = village;
    if (babyDetails !== undefined) updateFields.babyDetails = babyDetails;
    if (currentWeight !== undefined) updateFields.currentWeight = currentWeight;
    if (currentLength !== undefined) updateFields.currentLength = currentLength;

    const updatedUser = await User.findByIdAndUpdate(req.user.id, updateFields, { new: true }).select('-password');
    res.json(updatedUser);
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.user.id);
    res
      .clearCookie('access_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      })
      .status(200)
      .json({ message: 'User account has been deleted' });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /user/onboarding  (protected)
 * Saves all three onboarding steps and marks the user as onboarded.
 */
const saveOnboarding = async (req, res, next) => {
  try {
    const {
      deliveryType,
      deliveryDate,
      numBabies,
      babyName,
      gender,
      birthWeight,
      currentWeight,
      birthLength,
      currentLength,
      headCircumference,
      feedingMethod,
    } = req.body;

    const initialHistory = [];
    if (birthWeight || birthLength) {
      initialHistory.push({
        date: deliveryDate || 'At Birth',
        weight: birthWeight || '0',
        length: birthLength || '0',
        headCircumference: headCircumference || '0',
        notes: 'Birth measurements',
      });
    }
    if (currentWeight || currentLength) {
      initialHistory.push({
        date: new Date().toISOString().split('T')[0],
        weight: currentWeight || birthWeight || '0',
        length: currentLength || birthLength || '0',
        headCircumference: headCircumference || '0',
        notes: 'Onboarding baseline',
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        deliveryType,
        deliveryDate,
        numBabies,
        babyName,
        gender,
        birthWeight,
        currentWeight,
        birthLength,
        currentLength,
        headCircumference,
        feedingMethod,
        growthHistory: initialHistory,
        onboardingCompleted: true,
      },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'Onboarding saved successfully', user: updatedUser });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /user/growth-record (protected)
 * Adds a new growth measurement record to the baby's history.
 */
const addGrowthRecord = async (req, res, next) => {
  try {
    const { date, weight, length, headCircumference, notes } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const recordDate = date || new Date().toISOString().split('T')[0];
    const newRecord = {
      date: recordDate,
      weight: weight ? String(weight) : user.currentWeight || '0',
      length: length ? String(length) : user.currentLength || '0',
      headCircumference: headCircumference ? String(headCircumference) : user.headCircumference || '0',
      notes: notes || 'Follow-up visit measurement',
    };

    user.growthHistory.push(newRecord);
    if (weight) user.currentWeight = String(weight);
    if (length) user.currentLength = String(length);
    if (headCircumference) user.headCircumference = String(headCircumference);

    await user.save();
    const updatedUser = await User.findById(req.user.id).select('-password');
    res.status(200).json({ message: 'Growth record added successfully', user: updatedUser });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /user/social-login
 * Authenticates or creates user profile using Google/Facebook social login.
 */
const socialLogin = async (req, res, next) => {
  const { provider, email, fullName, phoneNumber, district, village } = req.body;

  if (!email || !provider) {
    return res.status(400).json({ message: 'Email and provider are required' });
  }

  try {
    let user = await User.findOne({ email });

    if (!user) {
      const randomPassword = await bcrypt.hash(Math.random().toString(36) + Date.now(), 12);
      const baseName = fullName || email.split('@')[0];
      user = new User({
        username: baseName,
        fullName: baseName,
        email,
        password: randomPassword,
        phoneNumber: phoneNumber || '',
        district: district || '',
        village: village || '',
        role: 'patient',
        onboardingCompleted: false,
      });
      await user.save();
    } else {
      if (fullName) user.fullName = fullName;
      if (phoneNumber) user.phoneNumber = phoneNumber;
      if (district) user.district = district;
      if (village) user.village = village;
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    user.isOnline = true;
    user.lastLogin = Date.now();
    await user.save();

    const { password: pass, ...rest } = user._doc;
    res.status(200).json({ ...rest, token });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  const { identity } = req.body;

  if (!identity) {
    return res.status(400).json({ message: 'Email or username is required' });
  }

  try {
    const user = await User.findOne({
      $or: [
        { email: identity.toLowerCase().trim() },
        { username: identity.trim() }
      ]
    });

    if (!user) {
      return res.status(404).json({ message: 'No account found with this email or username' });
    }

    // Generate a 6-digit verification reset code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordCode = resetCode;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

    return res.status(200).json({
      message: 'Reset verification code generated successfully!',
      email: user.email,
      resetCode,
    });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  const { identity, newPassword } = req.body;

  if (!identity || !newPassword) {
    return res.status(400).json({ message: 'Email/Username and new password are required' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long' });
  }

  try {
    const user = await User.findOne({
      $or: [
        { email: identity.toLowerCase().trim() },
        { username: identity.trim() }
      ]
    });

    if (!user) {
      return res.status(404).json({ message: 'No account found with this email or username' });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    user.resetPasswordCode = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.status(200).json({ message: 'Password reset successful! You can now log in.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signup,
  signin,
  signOut,
  getUser,
  updateUser,
  deleteUser,
  saveOnboarding,
  addGrowthRecord,
  socialLogin,
  forgotPassword,
  resetPassword,
};

