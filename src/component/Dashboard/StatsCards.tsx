import { Grid, Card, CardContent, Typography, Avatar, Box } from "@mui/material"
import { TrendingUp, AccessTime, Star, School } from "@mui/icons-material"
import { motion } from "framer-motion"

const statsCards = [
  { title: "Total Earnings", value: "₦125,000", icon: <TrendingUp />, color: "#4CAF50" },
  { title: "Active Sessions", value: "12", icon: <AccessTime />, color: "#2196F3" },
  { title: "Student Rating", value: "4.8", icon: <Star />, color: "#FFC107" },
  { title: "Completed Jobs", value: "38", icon: <School />, color: "#9C27B0" },
]

export default function StatsCards() {
  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {statsCards.map((card, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      {card.title}
                    </Typography>
                    <Typography variant="h4" component="div" sx={{ fontWeight: 600 }}>
                      {card.value}
                    </Typography>
                  </Box>
                  <Avatar
                    sx={{
                      backgroundColor: `${card.color}15`,
                      color: card.color,
                    }}
                  >
                    {card.icon}
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      ))}
    </Grid>
  )
}

