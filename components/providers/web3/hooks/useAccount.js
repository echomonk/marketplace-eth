


import { useEffect } from "react"
import useSWR from "swr"

const adminAdresses = {
    "0x7b8ed55ae7b67cd1269a2aea562099165b967af7ccf35f68d82c70ee331e7874" : true
}

export const handler = (web3, provider) => () => {

    const { data, mutate, ...rest } = useSWR(() => 
       web3 ? "web3/accounts" : null,
         async () => {
            const accounts = await web3.eth.getAccounts()
            return accounts[0]
        }
    )

    useEffect (() => {
        provider &&
        provider.on("accountsChanged",
        accounts =>mutate(accounts[0] ?? null)
        )
    }, [provider])

    return {
        data,
        isAdmin: (data && adminAdresses[web3.utils.keccak256(data)]) ?? false,
        mutate, 
        ...rest
  }
}