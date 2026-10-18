// Moving between the exercise screens (Today / Health form / Progress / Watch history).
// Kept free of React Native imports so it can be unit tested.

// Today and Health form are both the Exercise screen; Progress and History are the two tabs of
// the ExerciseProgress screen. `onLocal(key)` returns true when the current screen can switch
// section in place.
//
// React Navigation 7 puts another copy of a screen on the stack when you navigate to one that is
// already open, so the menu used to pile up screens. `pop: true` goes back to the open copy
// instead. `ts` changes on every call so the screen reacts even when the same section is asked
// for twice in a row.
// used by the side menu. pop:true prevents opening the same screen twice on the navigation stack.
export const goToSection = (navigation, key, onLocal) => {
    if (onLocal && onLocal(key)) return;
    const ts = Date.now();
    if (key === 'today' || key === 'form') {
        navigation.navigate('Exercise', { section: key, ts }, { pop: true });
    } else {
        navigation.navigate('ExerciseProgress', { tab: key === 'history' ? 'history' : 'progress', ts }, { pop: true });
    }
};
