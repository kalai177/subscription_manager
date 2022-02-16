const findexpirydate = async (valid_for) => {
  var days = parseInt(valid_for);
  const futuredate = new Date();
  futuredate.setDate(futuredate.getDate() + days);
  const valid_till = futuredate.toLocaleDateString();
  return valid_till;
};

const issubscriptioncrossed = (user, req, res) => {
  const expirydate = user.expires_at;
  const thisdate = new Date().toLocaleDateString();
  if (thisdate >= expirydate) {
    return 1;
  }
};

export { findexpirydate, issubscriptioncrossed };
