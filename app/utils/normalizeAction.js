import _ from 'lodash';

export default (action) => {
  if (['updateBoard', 'updateCard', 'updateList', 'updateChecklist'].includes(action.type)) {
    const updatedKeys = _.keys(action.data.old);
    return `${action.type}:${updatedKeys[0]}`;
  }
  return action.type;
};
