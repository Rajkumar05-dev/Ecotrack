package StreamApi;

import java.util.Arrays;
import java.util.List;

public class FindFirstElement {
public static void main(String[] args) {
	List<String> list = Arrays.asList("Raj", "Amit", "Rohit", "Sachin");
	String str = list.stream().findFirst().get();
	System.out.println(str);
}
}
