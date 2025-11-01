import React, { useEffect, useState } from 'react'
import { prepareExpenseBarCharData } from '../../utils/helper';
import CustomBarChart from '../Chatrs/CustomBarChart';

const Last30DaysExpenses = ({data}) => {

    const [chartData, setChartData] = useState([])

    useEffect(() => {
      const result = prepareExpenseBarCharData(data);
      setChartData(result)
    
      return () => {}
    }, [data])
    
    return (
        <div className='card col-span-1'>
            <div className='flex items-center justify-between'>
                <h5>Last 30 days Expenses</h5>
            </div>

            <CustomBarChart data={chartData}/>
        </div>
    )
}

export default Last30DaysExpenses