import React, { useEffect, useState } from 'react'
import { useUserAuth } from '../../Hooks/useUserAuth';
import DashboardLayout from '../../Components/layouts/DashboardLayout';
import { API_PATHS } from '../../utils/apiPaths';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';
import ExpenseOverview from '../../Components/Expense/ExpenseOverview';
import AddExpenseForm from '../../Components/Expense/AddExpenseForm';
import Modal from '../../Components/Modal';
import ExpenseList from '../../Components/Expense/ExpenseList';
import DeleteAlert from '../../Components/DeleteAlert';

const Expense = () => {
  useUserAuth();

  const [expenseData, setExpenseData] = useState([])
  const [loading, setLoading] = useState(false)
  const [openDeleteAlert, setOpenDeleteAlert] = useState({
    show:false,
    data:null,
  })
  const [openAddExpenseModal, setOpenAddExpenseModal] = useState(false)
  
  const fetchExpenseDetails = async () => {
    if(loading) return;

    setLoading(true);
    try{
      const resposne = await axiosInstance.get(`${API_PATHS.EXPENSE.GET_ALL_EXPENSE}`)

      if(resposne.data){
        setExpenseData(resposne.data)
      }
    }
    catch(error){
      console.log("Something went wrong, Please try again",error);
    }
    finally{
      setLoading(false);
    }
  }

  const handleAddExpense = async (expense) => {
    const {category, amount, date, icon} = expense;

    if(!category.trim()){
      toast.error("Category is required");
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
      await axiosInstance.post(API_PATHS.EXPENSE.ADD_EXPENSE, {category, amount, date, icon});

      setOpenAddExpenseModal(false);
      toast.success("Expense added successfully");
      fetchExpenseDetails();
    }
    catch(error){
      console.error("Error adding expense", error.resposne?.data?.message || error.message);
    }
  }

  const deleteExpense = async (id) => {
    try{
      await axiosInstance.delete(API_PATHS.EXPENSE.DELETE_EXPENSE(id));

      setOpenDeleteAlert({show:false, data:null});
      toast.success("Expense deleted Successfully");
      fetchExpenseDetails();
    }
    catch(error){
      console.error("Error deleting expense", error.resposne?.message?.data || error.message)
    }
  }
  
  const handleDownlaodExpenseDetails = async () => {
    try{
      const response = await axiosInstance.get(API_PATHS.EXPENSE.DOWNLOAD_EXPENSE, {responseType: 'blob'});
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a")
      link.href = url;
      link.setAttribute("download", "expenseDetails.xlsx");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    }
    catch(error){
      console.error("Error downloading expense details", error);
      toast.error("Failed to downlaod expense details. Please try again.")
    }
  }


  useEffect(() => {
      fetchExpenseDetails();
    
      return () => {}
    }, []);

  return (
    <DashboardLayout activeMenu="Expense" >
      <div className='my-5 mx-auto'>
        <div>
          <div>
            <ExpenseOverview 
              transactions={expenseData}
              onExpenseIncome={() => setOpenAddExpenseModal(true)}
            />
          </div>

          <ExpenseList
            transactions={expenseData}
            onDelete={(id) => {
              setOpenDeleteAlert({show:true, data:id});
            }}
            onDownload={handleDownlaodExpenseDetails}
          />

        </div>

        <Modal
          isOpen={openAddExpenseModal}
          onClose={() => setOpenAddExpenseModal(false)}
          title="Add Expense"
        >
          <AddExpenseForm onAddExpense={handleAddExpense}/>
        </Modal>

        <Modal 
          isOpen={openDeleteAlert.show}
          onClose={() => setOpenDeleteAlert({show:false, data:null})}
          title="Delete Expense"
        >
          <DeleteAlert
            content="Are you sure you want to delete this expense?"
            onDelete={() => deleteExpense(openDeleteAlert.data)}
          />
        </Modal>

      </div>
    </DashboardLayout>
  )
}

export default Expense