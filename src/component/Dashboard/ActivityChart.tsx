import { Card, CardContent, Typography, Box } from "@mui/material"
import { LineChart } from "@mui/x-charts"

const chartData = {
  dataset: [
    { week: "Mon", value: 2 },
    { week: "Tue", value: 5.5 },
    { week: "Wed", value: 2 },
    { week: "Thu", value: 8.5 },
    { week: "Fri", value: 1.5 },
    { week: "Sat", value: 5 },
    { week: "Sun", value: 3 },
  ],
}

export default function ActivityChart() {
  return (
    <Card sx={{ mb: 4 }}>
      <CardContent>
        <Typography variant="h6" mb={2}>
          Weekly Activity
        </Typography>
        <Box height={300}>
          <LineChart
            dataset={chartData.dataset}
            xAxis={[{ scaleType: "band", dataKey: "week" }]}
            series={[
              {
                dataKey: "value",
                color: "#6C5DD3",
                area: true,
                showMark: true,
              },
            ]}
            height={300}
            sx={{
              ".MuiLineElement-root": {
                strokeWidth: 2,
              },
              ".MuiAreaElement-root": {
                fillOpacity: 0.1,
              },
            }}
          />
        </Box>
      </CardContent>
    </Card>
  )
}

