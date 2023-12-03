import * as logger from "../../util/logger";

export default () => {

    const ignoredErrors = (stack: any): boolean => {
        return false;
    }
    
    process.on('uncaughtException', (err: Error) => {
        if (ignoredErrors(err.stack)) return;
        logger.run(`\n${err.stack}\n`, {
            color: "red", stringBefore: "\n", category: "Uncaught Exception"
        });
    });
    
    process.on('unhandledRejection', (reason: any) => {
        if (ignoredErrors(reason.stack)) return;
        logger.run(`\n${reason.stack ? reason.stack : reason}\n`, {
            color: "red", stringBefore: "\n", category: "Unhandled Rejection"
        });
    });

}