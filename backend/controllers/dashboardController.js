import { Lead } from "../models/Lead.js";
import { Activity } from "../models/Activity.js";

export const getDashboardSummary = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();

    // 1. All leads belonging to user
    const leads = await Lead.find({ createdBy: userId }).sort({ createdAt: -1 });

    const totalLeads = leads.length;
    // Active leads exclude Won and Lost
    const activeLeads = leads.filter(
      (l) => l.stage !== "Won" && l.stage !== "Lost"
    ).length;
    const wonLeads = leads.filter((l) => l.stage === "Won").length;
    const lostLeads = leads.filter((l) => l.stage === "Lost").length;

    // Stage distribution
    const stageMap = {
      New: 0,
      Contacted: 0,
      Qualified: 0,
      "Proposal Sent": 0,
      Won: 0,
      Lost: 0,
    };
    leads.forEach((l) => {
      if (stageMap[l.stage] !== undefined) {
        stageMap[l.stage] += 1;
      }
    });

    const leadsByStage = Object.keys(stageMap).map((stage) => ({
      stage,
      count: stageMap[stage],
    }));

    // 2. All activities belonging to user
    const activities = await Activity.find({ createdBy: userId })
      .populate("leadId", "name company stage")
      .sort({ dueAt: 1 });

    const pendingActivities = activities.filter((a) => a.status === "Pending");
    const completedActivities = activities.filter(
      (a) => a.status === "Completed"
    );

    // Overdue activities: status === Pending AND dueAt < now
    const overdueFollowUps = pendingActivities.filter(
      (a) => new Date(a.dueAt) < now
    );
    // Upcoming: status === Pending AND dueAt >= now
    const upcomingFollowUps = pendingActivities.filter(
      (a) => new Date(a.dueAt) >= now
    );

    // Follow-up status distribution
    const followUpDistribution = [
      { name: "Pending", count: pendingActivities.length - overdueFollowUps.length },
      { name: "Overdue", count: overdueFollowUps.length },
      { name: "Completed", count: completedActivities.length },
    ];

    // Lead creation trends (Group by month or recent 6 days/periods)
    const recentLeads = leads.slice(0, 5);

    // Group leads by date (last 7 days or creation buckets)
    const dateCounts = {};
    leads.forEach((l) => {
      const d = new Date(l.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      dateCounts[d] = (dateCounts[d] || 0) + 1;
    });

    const creationTrends = Object.keys(dateCounts).map((date) => ({
      date,
      count: dateCounts[date],
    }));

    res.status(200).json({
      success: true,
      data: {
        metrics: {
          totalLeads,
          activeLeads,
          wonLeads,
          lostLeads,
          pendingFollowUps: pendingActivities.length,
          overdueFollowUps: overdueFollowUps.length,
        },
        charts: {
          leadsByStage,
          followUpDistribution,
          creationTrends: creationTrends.length ? creationTrends : [{ date: "Today", count: totalLeads }],
        },
        recentLeads,
        upcomingFollowUps: upcomingFollowUps.slice(0, 5),
        overdueList: overdueFollowUps.slice(0, 5),
      },
    });
  } catch (error) {
    next(error);
  }
};

