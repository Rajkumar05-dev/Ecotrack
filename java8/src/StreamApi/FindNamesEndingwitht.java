package StreamApi;

import java.util.Arrays;
import java.util.List;

public class FindNamesEndingwitht {
	public static void main(String[] args) {
		List<String> list = Arrays.asList("Raj", "Amit", "Rohit", "Sachin");
		List<String> str = list.stream().filter(n -> n.endsWith("t")).toList();
		System.out.println(str);
	}
}
