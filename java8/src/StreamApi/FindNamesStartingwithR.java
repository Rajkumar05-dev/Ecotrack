package StreamApi;

import java.util.Arrays;
import java.util.List;

public class FindNamesStartingwithR {
public static void main(String[] args) {
	List<String> stri = Arrays.asList("Raj","Amit","Rohit","Sachin");
	List<String> str = stri.stream().filter(name->name.startsWith("R")).toList();
	System.out.println(str);
	
}
}
