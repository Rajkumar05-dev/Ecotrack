package StreamApi;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;


public class FindDuplicateElements {
	public static void main(String[] args) {
		List<Integer> list = Arrays.asList(1, 2, 3, 4, 2, 5, 3, 6, 1);
		Set<Integer> unique = new HashSet<>();
		List<Integer> co = list.stream().filter(n -> !unique.add(n)).toList();
		System.out.println(co);
	}
}
