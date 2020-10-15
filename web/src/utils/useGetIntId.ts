import { useRouter } from "next/router"

export const useGetIntId = () => {
    const router = useRouter()
    const urlId = router.query.id
    return typeof urlId === 'string' ? parseInt(urlId) : -1
}
