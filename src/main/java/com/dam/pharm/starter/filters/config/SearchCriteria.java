package com.dam.pharm.starter.filters.config;

public class SearchCriteria {

	private Class<?> keyType;
	private String key;
    private String operation;
    private Object value;


    public SearchCriteria(final Class<?> keyType,final String key, final String operation, final Object value) {
        super();
        this.keyType=keyType;
        this.key = key;
        this.operation = operation;
        this.value = value;
    }

    public String getKey() {
        return key;
    }
    
    
    public Class<?> getKeyType() {
  		return keyType;
  	}

  	public void setKeyType(Class<?> keyType) {
  		this.keyType = keyType;
  	}

    public void setKey(final String key) {
        this.key = key;
    }

    public String getOperation() {
        return operation;
    }

    public void setOperation(final String operation) {
        this.operation = operation;
    }

    public Object getValue() {
        return value;
    }

    public void setValue(final Object value) {
        this.value = value;
    }

}
