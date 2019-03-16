package com.dam.pharm.starter.utils;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;

public class GeneralUtil {

	public static boolean isValidObject(Object object) {
		return object != null && !object.equals(null);
	}

	public static boolean isValidText(String text) {
		return (text != null && !text.trim().equals(null) && !text.trim().equals("")&&text!="");
	}

	public static Date convertToDate(String receivedDate, String format) {
		SimpleDateFormat formatter = new SimpleDateFormat(format);
		Date date = null;
		try {
			date = formatter.parse(receivedDate);
		} catch (ParseException e) {
			date=new Date();
		}
		return date;
	}

}
