import { useRouter } from "next/router"
import { useEffect } from "react"
import { useMeQuery } from "../generated/graphql"

export const useIsAuth = () => {
    const [{ data, fetching }] = useMeQuery()
    const route = useRouter()
    useEffect(() => {
        if (!fetching && !data?.me)
            route.replace(`/login?next=${route.pathname}`)
    }, [fetching, data, route])
}
