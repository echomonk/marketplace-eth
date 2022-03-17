


import { useEffect } from "react"
import useSWR from "swr"

const adminAdresses = {
    "0x53a8b7587724a19606ea526a9a6a8b05eb228ecdf92bb82c86c379cd40090a78" : true
}

export const handler = (web3, provider) => () => {

    const { data, mutate, ...rest } = useSWR(() => 
       web3 ? "web3/accounts" : null,
         async () => {
            const accounts = await web3.eth.getAccounts()
            const account = accounts[0]

            if (!account) {
                throw new Error("Cannot retrieve an account. Please refresh the browser.")
            }
            return account
        }
    )

    useEffect (() => {
        const mutator = accounts => mutate(accounts[0] ?? null)
        provider?.on("accountsChanged", mutator)

        return () => {
            provider?.removeListener("accountsChanged", mutator)
        }
    }, [provider])

    return {
        data,
        isAdmin: (data && adminAdresses[web3.utils.keccak256(data)]) ?? false,
        mutate, 
        ...rest
  }
}