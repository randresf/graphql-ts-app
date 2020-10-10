import { MyContext } from "src/type";
import { MiddlewareFn } from "type-graphql";

export const isAuth: MiddlewareFn<MyContext> = ({ context }, next) => {
    const { userId } = context.req?.session
    if (!userId) {
        throw new Error('not authenticated')
    }
    return next()
}
