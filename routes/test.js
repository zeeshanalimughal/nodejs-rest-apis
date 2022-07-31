function validatePhoneNumber(phone) {
    var phoneno = /^\+?([0-9]{2})\)?([0-9]{10,})$/;
    if ((phone.match(phoneno))) {
        if (phone.indexOf('+') === -1) {
            return false;
        } else {
            return true;
        }
    } else {
        return false;
    }
}