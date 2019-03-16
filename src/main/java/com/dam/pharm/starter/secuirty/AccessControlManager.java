package com.dam.pharm.starter.secuirty;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.dam.pharm.starter.entities.User;

/**
 *
 * @author salah atwa
 */
@Service
public class AccessControlManager {

    public User getUsername() {
        return (User)SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }
}
