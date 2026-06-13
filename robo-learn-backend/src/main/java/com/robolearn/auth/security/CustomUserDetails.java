package com.robolearn.auth.security;

import com.robolearn.user.entity.User;
import com.robolearn.user.entity.Role;
import com.robolearn.user.entity.Permission;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.HashSet;
import java.util.Set;

public class CustomUserDetails implements UserDetails {

    private final User user;

    public CustomUserDetails(User user) {
        this.user = user;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        Set<GrantedAuthority> authorities = new HashSet<>();
        
        if (user.getRoles() != null) {
            for (Role role : user.getRoles()) {
                // Add the role itself (prefixed with ROLE_ to maintain Spring Security convention if needed)
                authorities.add(new SimpleGrantedAuthority("ROLE_" + role.getName()));
                
                // Add all specific permissions tied to this role
                if (role.getPermissions() != null) {
                    for (Permission permission : role.getPermissions()) {
                        authorities.add(new SimpleGrantedAuthority(permission.getName()));
                    }
                }
            }
        }
        return authorities;
    }

    @Override
    public String getPassword() {
        return user.getPassword();
    }

    @Override
    public String getUsername() {
        return user.getEmail(); // Reverting to email as primary identity for stable JWT
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return !user.isSuspended();
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    public String getRealUsername() {
        return user.getUsername();
    }

    public User getUser() {
        return user;
    }
}
