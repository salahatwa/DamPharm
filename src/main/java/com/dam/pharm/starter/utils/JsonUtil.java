package com.dam.pharm.starter.utils;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import com.dam.pharm.starter.filters.OrderFilter;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

public class JsonUtil {

	/**
	 * Convert Json to Object
	 * 
	 * @param json
	 * @param clazz
	 * @return
	 */
	public static <T> Object convertTextToObject(String json, Class<T> clazz) {

		Object customFilter = null;

		try {
			ObjectMapper mapper = new ObjectMapper();

			if (isJSONValid(json))
				customFilter = mapper.readValue(json, clazz);
		} catch (Exception ex) {
			ex.printStackTrace();
		}

		return customFilter;
	}

	public static String convertObjectToJson(Object object) {
		ObjectMapper mapper = new ObjectMapper();
		String jsonInString = null;
		try {
			jsonInString = mapper.writeValueAsString(object);
		} catch (JsonProcessingException e) {
			e.printStackTrace();
		}
		return jsonInString;
	}

	// public static void main(String[] args) {
	// OrderFilter filter=new OrderFilter();
	// filter.setId(1L);
	// String json = convertObjectToJson(filter);
	// System.err.println(json);
	// }

	public static boolean isJSONValid(String json) {
		try {
			if (!GeneralUtil.isValidText(json))
				return false;
			new JSONObject(json);
		} catch (JSONException ex) {
			try {
				new JSONArray(json);
			} catch (JSONException ex1) {
				return false;
			}
		}
		return true;
	}

}
