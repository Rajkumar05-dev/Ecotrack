package StreamApi;

import java.util.Arrays;
import java.util.List;

public class SquareOfEach {
public static void main(String[] args) {
	List<Integer> nums = Arrays.asList(1,2,3,4,5,6);
List<Integer> Square = nums.stream().map(n->n*n).toList();
System.out.println(Square);
	
	
}
}
