/**
 * Parse profile.
 *
 * @param {object|string} json
 * @return {object}
 * @access public
 */
exports.parse = function(json) {
    if ('string' == typeof json) {
        json = JSON.parse(json);
    }
    // receive all properties
    var profile = Object.assign({}, json.User);

    profile.id = json.User.Id;
    profile.realName = {
        FirstName: json.User.FirstName,
        MidName: json.User.MidName,
        LastName: json.User.LastName
    }
    profile.emails = [{ value: json.User.Account }];

    return profile;

};