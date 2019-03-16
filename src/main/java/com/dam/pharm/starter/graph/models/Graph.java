package com.dam.pharm.starter.graph.models;

public class Graph
{
    private String[] last;

    private String[] current;

    public String[] getLast ()
    {
        return last;
    }

    public void setLast (String[] last)
    {
        this.last = last;
    }

    public String[] getCurrent ()
    {
        return current;
    }

    public void setCurrent (String[] current)
    {
        this.current = current;
    }

    @Override
    public String toString()
    {
        return "ClassPojo [last = "+last+", current = "+current+"]";
    }
}
	