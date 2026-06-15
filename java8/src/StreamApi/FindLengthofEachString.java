package StreamApi;

import java.util.Arrays;
import java.util.List;

public class FindLengthofEachString {
public static void main(String[] args) {
	List<String> stri = Arrays.asList("Java","Spring","React");
	List<Integer> str = stri.stream().map(String::length).toList();
	System.out.println(str);
	
}  
}
