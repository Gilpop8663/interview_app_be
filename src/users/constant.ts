export const getCookieDomain = (referer: string) => {
  if (process.env.NODE_ENV === 'production') {
    if (referer) {
      return '.unfolloweasy.com';
    }

    return 'chrome-extension://limbfnbadjaoikobmelblpgmlpfnngec';
  }

  if (referer) {
    return 'localhost';
  }

  return 'chrome-extension://iabkmaonokgjbojbnmklpjpdibelfhef';
};
