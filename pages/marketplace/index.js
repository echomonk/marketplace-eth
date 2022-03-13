import { CourseCard, CourseList } from "@components/ui/course"
import { BaseLayout } from "@components/ui/layout"
import { getAllCourses } from "@content/courses/fetcher"
import { useWalletInfo } from "@components/hooks/web3"
import { Button } from "@components/ui/common"
import { OrderModal } from "@components/ui/order/modal"
import { useState } from "react"
import { MarketHeader } from "@components/ui/marketplace"
import { useWeb3 } from "@components/providers"

export default function Marketplace({courses}) {
  const { web3 } = useWeb3()
  const [selectedCourse, setSelectedCourse] = useState(null)
  const { canPurchaseCourse, account } = useWalletInfo()

  const purchaseCourse = order => {
    const hexCourseId = web3.utils.utf8ToHex(selectedCourse.id)
    console.log(hexCourseId)

    // hexCourseId
    // 0x31343130343734000000000000000000

    // address
    // 0x8E955B32C324fd9b5997f1b56C0cc44c3665aaF0

    // 313431303437340000000000000000008E955B32C324fd9b5997f1b56C0cc44c3665aaF0
    // orderHash
    // 762f73bc1af537caaab7ed7f5ae5e040da4a557bbb1b058070b5ebd5cf033b33
    const orderHash = web3.utils.soliditySha3(
      { type: "bytes16", value: hexCourseId },
      { type: "address", value: account.data}
    )
    console.log(orderHash)
    
    // emailHash of test@gmail.com
    // af257bcc3cf653863a77012256c927f26d8ab55c5bea3751063d049d0538b902
    const emailHash = web3.utils.sha3(order.email)
    console.log(emailHash)

    // proof = emailHash + orderHash
    // af257bcc3cf653863a77012256c927f26d8ab55c5bea3751063d049d0538b902762f73bc1af537caaab7ed7f5ae5e040da4a557bbb1b058070b5ebd5cf033b33
    // keccak256 d72d1a95c8116e9694c2bf03a32e5474063cbdcda7852d214d4700f93d2ff748
    const proof = web3.utils.soliditySha3(
      { type: "bytes32", value: emailHash },
      { type: "bytes32", value: orderHash }
    )
    console.log(proof)
  }
    
  return (
    <>
     <div className="py-4"> 
      <MarketHeader/>
     </div> 
      <CourseList
        courses={courses}
      >
       { course =>
        <CourseCard 
          key={course.id} 
          course={course}
          disabled={!canPurchaseCourse}
          Footer={() => 
            <div className="mt-4">
              <Button 
                onClick={() => setSelectedCourse(course)}
                disabled={!canPurchaseCourse}
                variant="lightPurple">
                Purchase
              </Button>
            </div>
          }
          />
       } 
      </CourseList> 
      { selectedCourse &&
      <OrderModal
        course={selectedCourse}
        onSubmit={purchaseCourse}
        onClose={() => setSelectedCourse(null)}
      />
      }
    </>
  )
}

export function getStaticProps() {
  const { data } = getAllCourses()
  return {
    props: {
      courses: data
    }
  }
}

Marketplace.Layout = BaseLayout