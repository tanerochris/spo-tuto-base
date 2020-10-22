const UserStatics = {
  getUserQuery(username, select = '') {
    const query = this.findOne().where('email', username);

    if (select) {
      query.select(select);
    }

    return query;
  }
};

module.exports = UserStatics;
