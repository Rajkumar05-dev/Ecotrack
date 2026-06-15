package StreamApi;

import java.util.Arrays;
import java.util.List;

public class SumAllNumbers {
public static void main(String[] args) {
	List<Integer> nums = Arrays.asList(1,2,3,4,5,6);
	Integer sum = nums.stream().reduce(0,(a,b)->a+b);
	System.out.println(sum);
	Integer mul = nums.stream().reduce(1,(a,b)->a*b);
	System.out.println(mul);
}
}
