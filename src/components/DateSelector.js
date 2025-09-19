import { Box } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from "@mui/x-date-pickers";

function DateSelector({ name, value, onChange }) {
    return (
        <Box>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <div className="datepick">
                    <DatePicker
                        label={name}
                        value={value || null} // Pass Dayjs object
                        onChange={(date) => onChange(name, date)} // Pass Dayjs object
                    />
                </div>
            </LocalizationProvider>
        </Box>
    );
}
export default DateSelector;
