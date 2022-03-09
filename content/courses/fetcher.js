
// imports course data
import courses from "./index.json"
// function to get all courses
export const getAllCourses = () => {
  // object is data in array format.
  // mapping for courses as an object
  return {
    data: courses,
    courseMap: courses.reduce((a, c, i) => {
      a[c.id] = c // a for accumulator. c.id retrieves the course id from json and assigns to the c. 
      a[c.id].index = i // creates index
      return a
    }, {}) // {} starts with empty object. starts with zero. and then iterates with a.
  }
}