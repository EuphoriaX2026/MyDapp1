import welcomeVideo from '../../../assets/img/Register_Pic/Wellcome1.mp4';
import welcomeImg2 from '../../../assets/img/Register_Pic/Wellcome2.jpg';
import welcomeImg3 from '../../../assets/img/Register_Pic/Wellcome3.jpg';
import welcomeImg4 from '../../../assets/img/Register_Pic/Wellcome4.jpg';

export const REGISTER_FOG_MASK =
  'linear-gradient(to bottom, transparent 0%, black 35%)';

export const registerWelcomeMedia = {
  video: welcomeVideo,
  step2: welcomeImg2,
  step3: welcomeImg3,
  step4: welcomeImg4,
} as const;
