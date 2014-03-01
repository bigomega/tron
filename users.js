var usr = {
  'zzz': {
    name: 'Zzz',
    id: 'zzz',
    channel: false
  }
};
module.exports.get = function(key){
  return usr[key];
};
module.exports.set = function(key, data){
  usr[key] = data;
};
module.exports.remove = function(key){
  delete usr[key];
};
