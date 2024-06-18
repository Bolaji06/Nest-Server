
export const registerValidation = {
    username: {
        notEmpty: {
            errorMessage: "username cannot be empty"
        },
        isLength: {
          option: {
            min: 3,
            max: 20,
        },
        errorMessage: "username should be 3-20 in characters"  
        }
    },
    email: {
        notEmpty: {
            errorMessage: 'email field cannot be empty'
        },
        isEmail: true,
    },
    password: {
        notEmpty: {
            errorMessage: 'password can not be empty'
        },
        isLength: {
            option: {
                min: 4,
                max: 20
            },
            errorMessage: 'password should be 3-20 in characters'
        }
    }
}