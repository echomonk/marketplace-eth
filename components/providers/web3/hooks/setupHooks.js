
import { handler as createAccountHook } from "./useAccount";
import { handler as createNetworkHook } from "./useNetwork";
import { handler as createUseOwnedCoursesHook } from "./useOwnedCourses"
import { handler as createUseOwnedCourseHook } from "./useOwnedCourse"
import { handler as createUseManagedCourseHook } from "./useManagedCourses"


export const setupHooks = ({web3, provider, contract}) => {
   
    return {
        useAccount: createAccountHook(web3, provider),
        useNetwork: createNetworkHook(web3, provider),
        useOwnedCourses: createUseOwnedCoursesHook(web3, contract),
        useOwnedCourse: createUseOwnedCourseHook(web3, contract),
        useManagedCourses: createUseManagedCourseHook(web3, contract)
    }   
}