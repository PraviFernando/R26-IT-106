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

const signOut = (req, res, next) => {
  try {
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
    const { fullName, age, district, village, babyDetails } = req.body;
    const updateFields = {};
    if (fullName !== undefined) updateFields.fullName = fullName;
    if (age !== undefined) updateFields.age = age;
    if (district !== undefined) updateFields.district = district;
    if (village !== undefined) updateFields.village = village;
    if (babyDetails !== undefined) updateFields.babyDetails = babyDetails;

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

module.exports = { signup, signin, signOut, getUser, updateUser, deleteUser, saveOnboarding };