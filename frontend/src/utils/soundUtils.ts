/**
 * Utility functions for playing notification sounds
 */

export const playErrorSound = (volume: number = 0.6): void => {
  try {
    const audio = new Audio('/sounds/wrong_5.mp3');
    audio.volume = volume;
    audio.play().catch(error => {
      console.log('Could not play error sound:', error);
    });
  } catch (error) {
    console.log('Error creating error audio:', error);
  }
};

export const playNotificationSound = (volume: number = 0.5): void => {
  try {
    const audio = new Audio('/sounds/dung_QugSu0k.mp3');
    audio.volume = volume;
    audio.play().catch(error => {
      console.log('Could not play notification sound:', error);
    });
  } catch (error) {
    console.log('Error creating notification audio:', error);
  }
};

export const playSoundByType = (type: 'message' | 'info' | 'success' | 'warning' | 'error', volume?: number): void => {
  if (type === 'error') {
    playErrorSound(volume);
  } else {
    playNotificationSound(volume);
  }
};
