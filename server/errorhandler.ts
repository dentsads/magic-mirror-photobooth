interface Error {
    message: any;
    code: string;
}

class ErrorHandler {
    private constructor() {}

    public static createError(code: string, message: any): any {
        return {'error': {
            'message': message,
            'code': code
        }};
    };

    public static createErrors(errorArray: Error[] = []): any {
        let resultArray = []
        errorArray.forEach( (err) => {
            resultArray.push({
                'message': err.message,
                'code': err.code
            });
        })

        return {'errors': errorArray};
    };
}

export { ErrorHandler, Error }