import { Box } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from "@mui/x-date-pickers";

function DateSelector( { name, onChange} ) {

    return (
        <Box>
            <LocalizationProvider dateAdapter={AdapterDayjs} >
                <div className="datepick">
                    <DatePicker label={name} onChange={(date) => onChange(name, date ? date.format("YYYY-MM-DD") : "")} />
                </div>
            </LocalizationProvider>
        </Box>
    );
}

export default DateSelector;