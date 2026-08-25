import { Box, Button, Typography } from "@mui/material";
import BackGround from "../assets/images/bg4.png"
import { Link } from "react-router-dom";
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
export const ErrorPage = () => {
    return (
        <div style={{
            backgroundImage: `url(${BackGround})`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            fontWeight: 'bold',
        }}>
            <Typography variant="h3" gutterBottom component="div" color="red" width={'500px'} marginTop={'250px'} sx={{ pt: 10 }}>
                404 - Page Not Found
            </Typography>
            <Typography variant="p" mb={'16px'}>The page you are looking for does not exist.</Typography>
            <Link to="/" style={{ textDecoration: 'none' }} >
                <Box sx={{display:'flex', alignItems:'center', justifyContent:'center',  p:1, bgcolor:'black', color:'white', width:'150px', cursor:'pointer', borderRadius:"10px" }}>
                    <ExitToAppIcon/>
                    <Button sx={{color:'white'}}>Go Back Home</Button>
                </Box>
            </Link>
        </div>
    );
}