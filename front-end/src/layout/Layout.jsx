import { Stack, Table } from '@mui/material';
// import { Outlet } from 'react-router-dom';
import "../layout/Layout.component.scss"
import Sidebar from '../component/sidebar/Sidebar';
import { ToastContainer } from 'react-toastify';

export default function Layout() {
    return (
        <Stack
        >
            <Sidebar />
             <ToastContainer 
                autoClose={1000}
                position="top-right"
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
        </Stack>

    );
}
