package StreamApi;

import java.util.Arrays;
import java.util.List;


public class GetTop3HighestNumbers {
public static void main(String[] args) {
	List<Integer> list = Arrays.asList(10, 50, 30, 20, 70, 40, 60);
 List<Integer> top = list.stream().sorted((a,b)->b-a).limit(3).toList();
	System.out.println(top);
}
}
