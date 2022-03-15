
import { handler as createAccountHook } from "./useAccount";
import { handler as createNetworkHook } from "./useNetwork";
import { handler as createUseOwnedCoursesHook } from "./useOwnedCourses"
import { handler as createUseOwnedCourseHook } from "./useOwnedCourse"

export const setupHooks = ({web3, provider, contract}) => {
   
    return {
        useAccount: createAccountHook(web3, provider),
        useNetwork: createNetworkHook(web3, provider),
        useOwnedCourses: createUseOwnedCoursesHook(web3, contract),
        useOwnedCourse: createUseOwnedCourseHook(web3, contract)
    }   
}