package StreamApi;

import java.util.Arrays;
import java.util.List;

public class RemoveDuplicates {
	public static void main(String[] args) {
		List<Integer> nums = Arrays.asList(1, 2, 2, 3, 3, 4, 5);
		List<Integer> num = nums.stream().distinct().toList();
		System.out.println(num);
	}
}
