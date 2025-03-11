export const logErrorAndThrow = (error: any, errorMessage: string): never => {
  // 콘솔에 에러를 출력
  console.error(error || errorMessage);

  // 에러를 던짐
  throw new Error(errorMessage);
};

export const getRandomNickname = (lang: string) => {
  const KOREAN_NICKNAME_LIST = [
    '언팔로우 탐험가',
    '친구 정리 전문가',
    '팔로잉 관리인',
    '연결 해제 전문가',
    '소셜 정리 마법사',
    '팔로워 조정사',
    '친구 정리 여행자',
    '관계 정리 전문가',
    '소셜 리셋 전문가',
    '연결 해제자',
  ];

  const ENGLISH_NICKNAME_LIST = [
    'Unfollow Explorer',
    'Friend Organizer',
    'Following Manager',
    'Disconnection Specialist',
    'Social Cleanup Wizard',
    'Follower Adjuster',
    'Friend Cleanup Traveler',
    'Relationship Organizer',
    'Social Reset Specialist',
    'Disconnector',
  ];

  const nicknameList =
    lang === 'ko' ? KOREAN_NICKNAME_LIST : ENGLISH_NICKNAME_LIST;
  const randomIndex = Math.floor(Math.random() * nicknameList.length);

  return nicknameList[randomIndex];
};
