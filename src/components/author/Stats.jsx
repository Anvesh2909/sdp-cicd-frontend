import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getAllCourses } from '../../store/actions/CourseAction';
import { Chart } from 'primereact/chart';
import axios from 'axios';
const Stats = () => {
  const courses = useSelector(state => state.courses.courses)
  const dispatch = useDispatch();

  const [courseTitles, setCourseTitles] = useState([]);
  const [enrolls, setEnrolls] = useState([]);
  const [chartData, setChartData] = useState({});
  const [chartOptions, setChartOptions] = useState({});

  useEffect(() => {
    getAllCourses(dispatch)

    const getStats = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/learner/course/getEnrollments", {
          headers: {
            'Authorization': "Bearer " + localStorage.getItem('token')
          }
        })
        setCourseTitles(response.data.courseTitles);
        setEnrolls(response.data.enrollments);

        const data = {
          labels: response.data.courseTitles,
          datasets: [
            {
              label: 'Courses',
              data: response.data.enrollments,
              backgroundColor: [
                'rgba(255, 159, 64, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(153, 102, 255, 0.2)'
              ],
              borderColor: [
                'rgb(255, 159, 64)',
                'rgb(75, 192, 192)',
                'rgb(54, 162, 235)',
                'rgb(153, 102, 255)'
              ],
              borderWidth: 1
            }
          ]
        };
        const options = {
          scales: {
            y: {
              beginAtZero: true
            }
          }
        };

        setChartData(data);
        setChartOptions(options);


      } catch (error) {
        console.log(error);

      }



    }
    getStats();


  }, []);



  //const courses = useState(useSelector(state=>state.courses.courses))


  return (
    <div className="p-4">
      <h2 className="text-center mb-4">Enrollment Stats</h2>
      <div style={{ width: '100%', maxWidth: '800px', height: '400px', margin: '0 auto' }}>
        <div className="card p-3" style={{ height: '100%' }}>
          {chartData && (
            <Chart type="bar" data={chartData} options={chartOptions} style={{ height: '100%' }} />
          )}
        </div>
      </div>
    </div>

  )
}

export default Stats