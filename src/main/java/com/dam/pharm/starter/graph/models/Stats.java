package com.dam.pharm.starter.graph.models;

public class Stats
{
    private String profit;

    private String cost;

    private String revenue;

    public String getProfit ()
    {
        return profit;
    }

    public void setProfit (String profit)
    {
        this.profit = profit;
    }

    public String getCost ()
    {
        return cost;
    }

    public void setCost (String cost)
    {
        this.cost = cost;
    }

    public String getRevenue ()
    {
        return revenue;
    }

    public void setRevenue (String revenue)
    {
        this.revenue = revenue;
    }

    @Override
    public String toString()
    {
        return "ClassPojo [profit = "+profit+", cost = "+cost+", revenue = "+revenue+"]";
    }
}