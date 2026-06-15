package StreamApi;

import java.util.Arrays;
import java.util.List;

public class SortNumbersAscending {
public static void main(String[] args) {
	List<Integer> nums = Arrays.asList(5,1,8,3,2);
	List<Integer> num = nums.stream().sorted((a,b)->a-b).toList();
	System.out.println(num);
}
}
