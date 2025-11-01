import React, { useEffect, useState } from 'react'
import IncomeOverview from '../../Components/Income/IncomeOverview'
import DashboardLayout from '../../Components/layouts/DashboardLayout'
import axiosInstance from '../../utils/axiosInstance'
import { API_PATHS } from '../../utils/apiPaths'
import Modal from '../../Components/Modal'
import AddIncomeForm from '../../Components/Income/AddIncomeForm'
import toast from 'react-hot-toast'
import IncomeList from '../../Components/Income/IncomeList'
import DeleteAlert from '../../Components/DeleteAlert'
import { data } from 'react-router-dom'
import { useUserAuth } from '../../Hooks/useUserAuth'

const Income = () => {
  useUserAuth();

  const [incomeData, setIncomeData] = useState([])
  const [loading, setLoading] = useState(false)
  const [openDeleteAlert, setOpenDeleteAlert] = useState({
    show:false,
    data:null,
  })
  const [openAddIncomeModal, setOpenAddIncomeModal] = useState(false)

  const fetchIncomeDetails = async () => {
    if(loading) return;

    setLoading(true);
    try{
      const resposne = await axiosInstance.get(`${API_PATHS.INCOME.GET_ALL_INCOME}`)

      if(resposne.data){
        setIncomeData(resposne.data)
      }
    }
    catch(error){
      console.log("Something went wrong, Please try again",error);
    }
    finally{
      setLoading(false);
    }
  }

  const handleAddIncome = async (income) => {
    const {source, amount, date, icon} = income;

    if(!source.trim()){
      toast.error("Source is required");
      return;
    }
    if(!amount || isNaN(amount) || Number(amount)<=0){
      toast.error("Enter valid amount Greater than 0");
      return;
    }
    if(!date){
      toast.error("Date is required");
      return;
    }

    try{
      await axiosInstance.post(API_PATHS.INCOME.ADD_INCOME, {source, amount, date, icon});

      setOpenAddIncomeModal(false);
      toast.success("Income added successfully");
      fetchIncomeDetails();
    }
    catch(error){
      console.error("Error adding income", error.resposne?.data?.message || error.message);
    }
  }

  const deleteIncome = async (id) => {
    try{
      await axiosInstance.delete(API_PATHS.INCOME.DELETE_INCOME(id));

      setOpenDeleteAlert({show:false, data:null});
      toast.success("Income deleted Successfully");
      fetchIncomeDetails();
    }
    catch(error){
      console.error("Error deleting income", error.resposne?.message?.data || error.message)
    }
  }

  const handleDownlaodIncomeDetails = async () => {
    try{
      const response = await axiosInstance.get(API_PATHS.INCOME.DOWNLOAD_INCOME, {responseType: 'blob'});
      
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url;
      link.setAttribute("download", "incomeDetails.xlsx");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    }
    catch(error){
      console.error("Error downloading income details", error);
      toast.error("Failed to downlaod income details. Please try again.")
    }
  }

  useEffect(() => {
    fetchIncomeDetails();
  
    return () => {}
  }, []);  

  return (
    <DashboardLayout activeMenu="Income" >
      <div className='my-5 mx-auto'>
        <div className='grid grid-cols-1 gap-6'>
          <div className=''>
            <IncomeOverview 
              transactions={incomeData}
              onAddIncome={() => setOpenAddIncomeModal(true)}
            />
          </div>
          <IncomeList
            transactions={incomeData}
            onDelete={(id) => {
              setOpenDeleteAlert({show:true, data:id});
            }}
            onDownload={handleDownlaodIncomeDetails}
          />
        </div>

        <Modal 
          isOpen={openAddIncomeModal}
          onClose={() => setOpenAddIncomeModal(false)}
          title="Add Income"
        >
          <AddIncomeForm onAddIncome={handleAddIncome}/>
        </Modal>

        <Modal 
          isOpen={openDeleteAlert.show}
          onClose={() => setOpenDeleteAlert({show:false, data:null})}
          title="Delete Income"
        >
          <DeleteAlert
            content="Are you sure you want to delete this income?"
            onDelete={() => deleteIncome(openDeleteAlert.data)}
          />
        </Modal>

      </div>
    </DashboardLayout>
  )
}

export default Income