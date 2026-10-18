package com.learn.ecotrack.Entities;



import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class User implements UserDetails {

	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	
	private String id;
	@Column(nullable = false)
	private String name;
	@Column(nullable = false,unique = true)
	private  String email;
	@Column(nullable = false,unique = false)
	@JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
	private  String password;
	@Column(nullable = false)
	private String phoneNo;
	
	@OneToMany(mappedBy = "user")
	@JsonBackReference("user-request")
	private List<RecycleRequest> recycleRequests;
	
	@ManyToOne
	@JsonManagedReference
	@JsonIgnore
	private Role role;
	@OneToMany(mappedBy ="user")
	@JsonBackReference("user-enrollment")
	private List<Enrollments> enrollment=new ArrayList<Enrollments>();
	
	
	@Override
	public Collection<? extends GrantedAuthority> getAuthorities() {
		return Arrays.asList(new SimpleGrantedAuthority(role.getAppRole().toString()));
		
	}
	@Override
	public String getUsername() {
		// TODO Auto-generated method stub
		return email;
	}
	@Override
	public String getPassword() {
		// TODO Auto-generated method stub
		return password;
	}

	
	@Override
	public  boolean isAccountNonExpired() {
		return true;
	}

	
	@Override
	public  boolean isAccountNonLocked() {
		return true;
	}

	
	@Override
	public  boolean isCredentialsNonExpired() {
		return true;
	}

	@Override
	public  boolean isEnabled() {
		return true;
	}
}
