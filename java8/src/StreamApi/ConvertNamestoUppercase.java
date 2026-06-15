package StreamApi;

import java.util.Arrays;
import java.util.List;

public class ConvertNamestoUppercase {
public static void main(String[] args) {
	List<String> list = Arrays.asList("raj","amit","rohit");
List<String> aList = list.stream().map(String::toUpperCase ).toList();
	System.out.println(aList);
}
}
