export const successCode = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
};


export const successMessage = {
    LOGIN_SUCCESS: 'Login Success',
    CREATE_POST_SUCCESS: 'Create Success',
    READ_POST_SUCCESS: 'Find Success',
    UPDATE_POST_SUCCESS: 'Update Success',
    DELETE_POST_SUCCESS: 'Delete Success',
};
export const SuccessData = (
    statusCode: number,
    message?: string,
    data?: any,
) => {
    if (statusCode === 200 && !message) {
        message = 'success';
    }
    return {
        statusCode,
        message,
        data,
    };
};